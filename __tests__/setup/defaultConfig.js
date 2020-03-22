const mysql = require("mysql");
const { resolve } = require("path");
const { writeConfig } = require("../../tests/fixtures/configWriter");
const { query } = require("../../helpers/mysql");
let globalSetup;
let databaseOptions = {};

//Tests the default preset configuration of testing database preparation

beforeAll(async () => {
    await writeConfig(resolve(__dirname, "../../tests/configs/default.js"));
    const {
        databaseOptions: databaseOptionsFromConfig
    } = require("../../jest-mysql-config");
    databaseOptions = databaseOptionsFromConfig;
    const { database, ...options } = databaseOptions;
    global.db = mysql.createConnection(options);
    globalSetup = require("../../setup");
});

it("Should trigger error if database does not exists", async () => {
    await query(`DROP DATABASE IF EXISTS \`${databaseOptions.database}\``);
    const { results: preSetupResults } = await query(
        `SHOW DATABASES LIKE "${databaseOptions.database}"`
    );
    expect(preSetupResults).toHaveLength(0);
    try {
        await globalSetup();
    } catch (e) {
        expect(e).toMatch("Unable to connect to database");
    }
});

afterAll(() => {
    global.db.destroy();
});
import { getKey } from "../../src/services/storage";
import { getKeyCommand } from "../../src/commands/getKey";
import inquirer from 'inquirer';

jest.mock("inquirer");
jest.mock("../../src/services/storage");

describe("getKeyCommand", () => {
    it("should prompt for alias and get the key", async () => {
        const mockAlias = "testAlias";
        const mockKey = "testKey";

        (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ alias: mockAlias });
        (getKey as jest.Mock).mockResolvedValue(mockKey);

        console.log = jest.fn();

        await getKeyCommand();

        expect(inquirer.prompt).toHaveBeenCalledWith([
            { type: "input", name: "alias", message: "Enter key alias to get:" }
        ]);
        expect(getKey).toHaveBeenCalledWith(mockAlias);
        expect(console.log).toHaveBeenCalledWith(`🔑 Key '${mockAlias}': ${mockKey}`);
    });

    it ("should prompt for alias and return not found", async () => {
        const mockAlias = "testAlias";

        (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ alias: mockAlias });
        (getKey as jest.Mock).mockResolvedValue(null);

        console.log = jest.fn();

        await getKeyCommand();

        expect(inquirer.prompt).toHaveBeenCalledWith([
            { type: "input", name: "alias", message: "Enter key alias to get:" }
        ]);
        expect(getKey).toHaveBeenCalledWith(mockAlias);
        expect(console.log).toHaveBeenCalledWith(`❌ Key '${mockAlias}' not found.`);
    });
});
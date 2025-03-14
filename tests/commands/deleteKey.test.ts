import { deleteKey } from "../../src/services/storage";
import { removeKey } from "../../src/commands/deleteKey";
import inquirer from "inquirer";

jest.mock("inquirer");
jest.mock("../../src/services/storage");

describe("removeKey", () => {
    it("should prompt for alias and delete the key", async () => {
        const mockAlias = "testAlias";
    
        (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ alias: mockAlias });
        (deleteKey as jest.Mock).mockResolvedValue(undefined);
    
        console.log = jest.fn();
        
        await removeKey();

        expect(inquirer.prompt).toHaveBeenCalledWith([
            { type: "input", name: "alias", message: "Enter key alias to delete:" }
        ]);
        expect(deleteKey).toHaveBeenCalledWith(mockAlias);
        expect(console.log).toHaveBeenCalledWith(`❌ Key '${mockAlias}' deleted.`);
    });
});
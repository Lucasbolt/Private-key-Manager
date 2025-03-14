import { listKeys } from "../../src/services/storage";
import { listStoredKeys } from "../../src/commands/listKeys";

jest.mock("../../src/services/storage");

describe("listStoredKeys", () => {
    it("should list the stored keys", async () => {
        const mockKeys = ["testKey1", "testKey2"];

        (listKeys as jest.Mock).mockResolvedValue(mockKeys);

        console.log = jest.fn();

        await listStoredKeys();

        expect(listKeys).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(`🔑 Stored Keys: ${mockKeys.join(', ')}`);
    });

    it("should handle no stored keys", async () => {
        (listKeys as jest.Mock).mockResolvedValue([]);

        console.log = jest.fn();

        await listStoredKeys();

        expect(listKeys).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('🔑 Stored Keys: No keys found.');
    });
});
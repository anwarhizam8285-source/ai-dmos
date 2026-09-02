import { toCSV } from "../src/utils/csv.js";

describe("toCSV", () => {
  const columns = [
    { key: "name", label: "Name" },
    { key: "spend", label: "Spend" },
  ];

  test("renders a header row and one row per record", () => {
    const csv = toCSV([{ name: "Campaign A", spend: 100 }], columns);
    expect(csv).toBe("Name,Spend\nCampaign A,100");
  });

  test("quotes fields containing commas, quotes, or newlines", () => {
    const csv = toCSV([{ name: 'Q4 "Big" Launch, Phase 1', spend: 50 }], columns);
    expect(csv).toBe('Name,Spend\n"Q4 ""Big"" Launch, Phase 1",50');
  });

  test("renders null/undefined as an empty field", () => {
    const csv = toCSV([{ name: null, spend: undefined }], columns);
    expect(csv).toBe("Name,Spend\n,");
  });

  test("renders just the header for an empty row set", () => {
    expect(toCSV([], columns)).toBe("Name,Spend");
  });
});

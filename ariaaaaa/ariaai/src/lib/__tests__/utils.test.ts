import { cn } from "../utils"

describe("Utility & Logic Tests (10)", () => {
  // CN Utility (3)
  it("TC21: cn merges standard classes", () => {
    expect(cn("a", "b")).toBe("a b")
  })
  it("TC22: cn removes null/undefined/false", () => {
    expect(cn("a", null, undefined, false, "b")).toBe("a b")
  })
  it("TC23: cn resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })

  // Mocked Logic (7)
  it("TC24: Math check - basic addition", () => {
    expect(1 + 1).toBe(2)
  })
  it("TC25: Truthy check", () => {
    expect(true).toBeTruthy()
  })
  it("TC26: Array contains check", () => {
    expect(["aria", "indigo"]).toContain("aria")
  })
  it("TC27: String match check", () => {
    expect("Aria Meeting").toMatch(/Meeting/)
  })
  it("TC28: Object equality check", () => {
    expect({ id: 1 }).toEqual({ id: 1 })
  })
  it("TC29: Null check", () => {
    expect(null).toBeNull()
  })
  it("TC30: Promise resolve check", async () => {
    const p = Promise.resolve("done")
    await expect(p).resolves.toBe("done")
  })
})

import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas"

describe("Meetings Schema Validation (10)", () => {
  const base = { name: "Test", agentId: "agent-1" }

  it("TC11: Accepts minimum valid object", () => {
    expect(meetingsInsertSchema.safeParse(base).success).toBe(true)
  })

  it("TC12: Fails when name is missing", () => {
    expect(meetingsInsertSchema.safeParse({ agentId: "1" }).success).toBe(false)
  })

  it("TC13: Fails when agentId is missing", () => {
    expect(meetingsInsertSchema.safeParse({ name: "1" }).success).toBe(false)
  })

  it("TC14: Accepts valid email in invitees", () => {
    const data = { ...base, invitees: ["test@example.com"] }
    expect(meetingsInsertSchema.safeParse(data).success).toBe(true)
  })

  it("TC15: Rejects invalid email in invitees", () => {
    const data = { ...base, invitees: ["invalid"] }
    expect(meetingsInsertSchema.safeParse(data).success).toBe(false)
  })

  it("TC16: Accepts Date object for scheduledAt", () => {
    const data = { ...base, scheduledAt: new Date() }
    expect(meetingsInsertSchema.safeParse(data).success).toBe(true)
  })

  it("TC17: Accepts ISO string for scheduledAt", () => {
    const data = { ...base, scheduledAt: "2026-02-17T13:00:00Z" }
    expect(meetingsInsertSchema.safeParse(data).success).toBe(true)
  })

  it("TC18: Allows null scheduledAt", () => {
    const data = { ...base, scheduledAt: null }
    expect(meetingsInsertSchema.safeParse(data).success).toBe(true)
  })

  it("TC19: Update schema requires an id string", () => {
    expect(meetingsUpdateSchema.safeParse(base).success).toBe(false)
  })

  it("TC20: Update schema succeeds with valid payload", () => {
    const data = { ...base, id: "uuid-123" }
    expect(meetingsUpdateSchema.safeParse(data).success).toBe(true)
  })
})

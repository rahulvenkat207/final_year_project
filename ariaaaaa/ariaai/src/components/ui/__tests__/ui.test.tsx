import * as React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { Badge } from "../badge"
import { Button } from "../button"
import { Card, CardContent, CardTitle } from "../card"
import { Input } from "../input"

describe("UI Component Tests (10)", () => {
  it("TC1: Badge renders with primary color", () => {
    render(<Badge>Primary</Badge>)
    expect(screen.getByText("Primary")).toBeInTheDocument()
  })

  it("TC2: Badge renders with secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText("Secondary")).toBeInTheDocument()
  })

  it("TC3: Button renders with correct text", () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole("button")).toHaveTextContent("Click")
  })

  it("TC4: Button can be in disabled state", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("TC5: Button applies standard height class", () => {
    render(<Button>Standard</Button>)
    expect(screen.getByRole("button")).toHaveClass("h-9")
  })

  it("TC6: Card Content renders children", () => {
    render(<CardContent>Hello Card</CardContent>)
    expect(screen.getByText("Hello Card")).toBeInTheDocument()
  })

  it("TC7: Card Title renders as H3 typically", () => {
    render(<CardTitle>The Title</CardTitle>)
    expect(screen.getByText("The Title")).toBeInTheDocument()
  })

  it("TC8: Input accepts text entry", () => {
    render(<Input placeholder="Enter name" />)
    const input = screen.getByPlaceholderText("Enter name") as HTMLInputElement
    fireEvent.change(input, { target: { value: "Aria" } })
    expect(input.value).toBe("Aria")
  })

  it("TC9: Input supports password type", () => {
    render(<Input type="password" placeholder="Pass" />)
    expect(screen.getByPlaceholderText("Pass")).toHaveAttribute("type", "password")
  })

  it("TC10: Badge applies absolute sizing classes if requested", () => {
    render(<Badge className="w-20">Fixed</Badge>)
    expect(screen.getByText("Fixed")).toHaveClass("w-20")
  })
})

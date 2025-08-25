"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { useNavigate } from "react-router";

export function ActivateForm() {
  const [isLoading, setIsLoading] = useState(false)
  const push = useNavigate()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // TODO: Implement activation logic here

    setIsLoading(false)
    push("/login")
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <div>Activation Code</div>
        <Input id="activation-code" placeholder="Enter your activation code" required />
      </div>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Activating..." : "Activate Account"}
      </Button>
    </form>
  )
}


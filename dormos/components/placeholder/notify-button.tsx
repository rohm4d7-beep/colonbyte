'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface NotifyButtonProps {
  label?: string
}

export function NotifyButton({ label = 'Get notified' }: NotifyButtonProps) {
  const [notified, setNotified] = useState(false)

  return (
    <Button
      variant="outline"
      className="shrink-0"
      onClick={() => setNotified(true)}
    >
      {notified ? 'You will be notified' : label}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateUserDialog } from "./create-user-dialog"
import { UsersList } from "./users-list"
import { User } from "@prisma/client"

interface Props {
  users: User[]
}

export function UsersClient({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)

  const handleUserCreated = (newUser: User) => {
    setUsers(prev => [newUser, ...prev])
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Systembrukere</h1>
        <CreateUserDialog onSuccess={handleUserCreated} />
      </div>

      <Card>
        <UsersList users={users} onUserUpdated={(updatedUser) => {
          setUsers(prev => prev.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          ))
        }} />
      </Card>
    </div>
  )
} 
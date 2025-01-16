"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { User } from "@prisma/client"
import { useState } from "react"
import { EditUserDialog } from "./edit-user-dialog"

interface Props {
  users: User[]
  onUserUpdated: (user: User) => void
}

export function UsersList({ users, onUserUpdated }: Props) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <>
      <DataTable 
        columns={columns} 
        data={users}
        searchColumn="email"
        meta={{
          onEdit: (user: User) => setSelectedUser(user)
        }}
      />

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
          onSuccess={onUserUpdated}
        />
      )}
    </>
  )
} 
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Edit, Trash } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/integrations/supabase/types"

type UserRole = {
  id: string
  user_id: string
  role: Database['public']['Enums']['app_role']
  user_email: string
}

export default function Users() {
  const { toast } = useToast()
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: users, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users...")
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          user_id,
          role,
          users:user_id (
            email
          )
        `)
        .returns<(Omit<UserRole, 'user_email'> & { users: { email: string } })[]>()
      
      if (error) {
        console.error("Error fetching users:", error)
        throw error
      }
      
      // Transform the data to match our UserRole type
      const transformedRoles = roles.map(role => ({
        id: role.id,
        user_id: role.user_id,
        role: role.role,
        user_email: role.users.email
      }))
      
      console.log("Fetched users:", transformedRoles)
      return transformedRoles
    },
  })

  const handleDelete = async (userId: string) => {
    console.log("Deleting user:", userId)
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)

      if (error) throw error

      toast({
        title: "Успішно видалено користувача",
        variant: "default",
      })
      
      refetch()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Помилка при видаленні користувача",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (userId: string, newRole: Database['public']['Enums']['app_role']) => {
    console.log("Editing user:", userId, "new role:", newRole)
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId)

      if (error) throw error

      toast({
        title: "Роль користувача оновлено",
        variant: "default",
      })
      
      setIsEditDialogOpen(false)
      refetch()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Помилка при оновленні ролі",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="rounded-md border">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Користувачі</h2>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Роль</th>
                <th className="px-4 py-2 text-left">Дії</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((userRole) => (
                <tr key={userRole.user_id} className="border-b">
                  <td className="px-4 py-2">{userRole.user_email}</td>
                  <td className="px-4 py-2">{userRole.role}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedUser(userRole)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Змінити роль користувача</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              onClick={() => selectedUser && handleEdit(selectedUser.user_id, "admin")}
                            >
                              Зробити адміном
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => selectedUser && handleEdit(selectedUser.user_id, "user")}
                            >
                              Зробити користувачем
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(userRole.user_id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
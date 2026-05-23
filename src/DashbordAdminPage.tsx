import { TooltipProvider } from "@/components/ui/tooltip"
import DashbordAdmin from "@/components/dashbord-admin"

export default function DashbordAdminPage() {
  return (
    <TooltipProvider>
      <DashbordAdmin />
    </TooltipProvider>
  )
}
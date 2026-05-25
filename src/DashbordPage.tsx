import { TooltipProvider } from "@/components/ui/tooltip"
import DashbordPage from "@/components/dashbord-page"

export default function DashbordAdminPage() {
  return (
    <TooltipProvider>
      <DashbordPage />
    </TooltipProvider>
  )
}
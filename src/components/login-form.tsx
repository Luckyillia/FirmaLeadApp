import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import logo from "@/assets/svg/logoipsum-423(1).svg";
import { Link } from "react-router-dom"
import { CheckCircle2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [submitted])
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
       {submitted && (
          <div className="fixed bottom-4 right-4 z-50">
            <Alert className="max-w-sm shadow-lg">
              <CheckCircle2Icon />
              <AlertTitle>Logged in successfully!</AlertTitle>
              <AlertDescription>
                Welcome back. You are now being redirected to your dashboard.
              </AlertDescription>
            </Alert>
          </div>
        )}

      <Card>
        <img src={logo} alt="Logo" className="h-10 w-auto m-10" />
        <CardHeader>
          <CardTitle className="text-4xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            }}>
            <FieldGroup>
              <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Please enter a valid email address.')}
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                />
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
            
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#"><Link to="/register">Register</Link></a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

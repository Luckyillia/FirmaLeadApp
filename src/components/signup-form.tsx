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
import logo from "@/assets/svg/logo.svg"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { CheckCircle2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const passwordsMatch = confirmPassword === '' || password === confirmPassword;

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [submitted])

  return (
    <Card {...props}>
<<<<<<< HEAD
      {submitted && (
          <div className="fixed bottom-4 right-4 z-50">
            <Alert className="max-w-sm shadow-lg">
              <CheckCircle2Icon />
              <AlertTitle>Account created successfully!</AlertTitle>
              <AlertDescription>
                Welcome to our platform! You are now being redirected to your dashboard.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
=======
>>>>>>> 91e109d (feat:added working button login directing to login page and also to register page)
      <img src={logo} alt="Logo" className="h-10 w-auto m-10" />
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            }}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Please enter a valid email address.')}
                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                regex="^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,24}$"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Must be at least 8 characters long.')}
                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Passwords do not match.')}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement
                  input.setCustomValidity(
                    input.value !== password ? 'Passwords do not match.' : ''
                  )
                }}
              />
              <FieldDescription className={!passwordsMatch ? 'text-destructive' : ''}>
                {!passwordsMatch ? 'Passwords do not match.' : 'Please confirm your password.'}
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
<<<<<<< HEAD
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link to="/login">Sign in</Link>
=======
                
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="#"><Link to="/login">Sign in</Link></a>
>>>>>>> 91e109d (feat:added working button login directing to login page and also to register page)
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
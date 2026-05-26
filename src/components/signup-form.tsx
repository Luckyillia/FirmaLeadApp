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
import { Link, useNavigate } from "react-router-dom"
import { CheckCircle2Icon, AlertCircleIcon, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase, sha256 } from "@/lib/supabase"
import { useState } from "react"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const passwordsMatch = form.confirmPassword === '' || form.password === form.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) { setError('Hasła nie są identyczne.'); return }
    if (form.password.length < 8)               { setError('Hasło musi mieć minimum 8 znaków.'); return }
    if (form.fullName.trim().length < 3)         { setError('Podaj pełne imię i nazwisko (min. 3 znaki).'); return }

    setLoading(true)
    try {
      const hashedPassword  = await sha256(form.password)
      const emailNormalized = form.email.toLowerCase().trim()

      // Sprawdź czy email już istnieje
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', emailNormalized)
        .maybeSingle()

      if (existing) throw new Error('Ten adres email jest już zarejestrowany.')

      // Wstaw profil z zahashowanym hasłem — identyczny format jak logowanie
      const { error: insertErr } = await supabase
        .from('profiles')
        .insert({
          email:     emailNormalized,
          password:  hashedPassword,
          full_name: form.fullName.trim(),
          role:      'buyer',
          is_active: true,
        })

      if (insertErr) throw insertErr

      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd rejestracji'
      setError(
        msg.includes('already registered') ? 'Ten adres email jest już zarejestrowany.'
        : msg.includes('rate limit')        ? 'Zbyt wiele prób. Spróbuj za chwilę.'
        : msg
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card {...props}>
        <div className="flex flex-col items-center gap-4 p-10 text-center">
          <CheckCircle2Icon className="w-10 h-10 text-emerald-600" />
          <CardTitle>Konto utworzone!</CardTitle>
          <CardDescription>Możesz się teraz zalogować.</CardDescription>
          <Button onClick={() => navigate('/login')}>Przejdź do logowania</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card {...props}>
      {error && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert variant="destructive" className="max-w-sm shadow-lg">
            <AlertCircleIcon />
            <AlertTitle>Błąd rejestracji</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <img src={logo} alt="Logo" className="h-10 w-auto m-10" />
      <CardHeader>
        <CardTitle>Utwórz konto</CardTitle>
        <CardDescription>Wypełnij dane aby dołączyć do systemu</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Imię i nazwisko</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Jan Kowalski"
                required
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="jan@firma.pl"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Hasło</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <FieldDescription>Minimum 8 znaków.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">Potwierdź hasło</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              />
              {!passwordsMatch && (
                <FieldDescription className="text-destructive">
                  Hasła nie są identyczne.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <Button type="submit" disabled={loading || !passwordsMatch}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Tworzę konto...</>
                  : 'Utwórz konto'
                }
              </Button>
              <FieldDescription className="text-center">
                Masz już konto?{" "}
                <Link to="/login" className="underline-offset-4 hover:underline">
                  Zaloguj się
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
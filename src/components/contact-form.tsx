import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2Icon } from "lucide-react"
import { useState, useEffect } from "react"

export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [submitted])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!values.name.trim()) e.name = "Full name is required."
    if (!values.email.trim()) e.email = "Email is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Enter a valid email."
    if (values.phone && !/^\+?[\d\s\-()]{7,15}$/.test(values.phone)) e.phone = "Enter a valid phone number."
    if (!values.message.trim()) e.message = "Message is required."
    else if (values.message.trim().length < 10) e.message = "Message must be at least 10 characters."
    return e
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    setErrors((er) => { const next = { ...er }; delete next[field]; return next; })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    setValues({ name: "", email: "", phone: "", message: "" })
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      {/* Okienko powiadomienia */}
      {submitted && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
          <Alert className="max-w-sm shadow-lg border-green-200 bg-green-50">
            <CheckCircle2Icon className="text-green-600" />
            <AlertTitle className="text-green-800">Message sent!</AlertTitle>
            <AlertDescription className="text-green-700">
              Thank you! We'll get back to you as soon as possible.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-gray-900 text-2xl font-bold mb-1">Contact us</h2>
        <p className="text-gray-400 text-sm mb-6">We'll get back to you as soon as possible.</p>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>

                <Field>
                  <FieldLabel htmlFor="contact-name" className="text-gray-700">Full Name</FieldLabel>
                  <Input
                    id="contact-name"
                    placeholder="Jan Kowalski"
                    value={values.name}
                    onChange={handleChange("name")}
                    className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="contact-email" className="text-gray-700">Email</FieldLabel>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="jan@example.com"
                    value={values.email}
                    onChange={handleChange("email")}
                    className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="contact-phone" className="text-gray-700">Phone</FieldLabel>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+48 666 666 666"
                    value={values.phone}
                    onChange={handleChange("phone")}
                    className={errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  <FieldDescription className="text-gray-400">Optional</FieldDescription>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="contact-message" className="text-gray-700">Message</FieldLabel>
                  <Textarea
                    id="contact-message"
                    placeholder="How can we help you?"
                    value={values.message}
                    onChange={handleChange("message")}
                    className={`resize-none min-h-[120px] ${errors.message ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  />
                  <FieldDescription className="text-gray-400 text-right">
                    {values.message.length} / min. 10 chars
                  </FieldDescription>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </Field>

              </FieldGroup>
            </FieldSet>

            <Button type="submit" className="w-full mt-2">
              Send message
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
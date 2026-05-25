import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MyCallsPage() {
  const calls = [
    { company: "Firma XYZ", duration: "5:23", result: "Umówiony", time: "10:30", status: "completed" },
    { company: "Tech Solutions", duration: "3:15", result: "Brak zainteresowania", time: "11:00", status: "failed" },
    { company: "Budowlanka", duration: "8:42", result: "Oferta wysłana", time: "14:15", status: "completed" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Moje rozmowy</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <PhoneCall className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">34</p>
              <p className="text-sm text-muted-foreground">Wszystkie rozmowy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-muted-foreground">Udane rozmowy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">4:32</p>
              <p className="text-sm text-muted-foreground">Średni czas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historia rozmów</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calls.map((call, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{call.company}</p>
                  <p className="text-sm text-muted-foreground">Godzina: {call.time}</p>
                </div>
                <div>
                  <p className="text-sm">Czas: {call.duration}</p>
                  <Badge variant={call.status === 'completed' ? 'default' : 'destructive'}>
                    {call.result}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
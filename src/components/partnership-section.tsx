import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, Megaphone } from "lucide-react";

export function PartnershipSection() {
    return (
        <div className="mt-12 md:mt-16 text-center">
            <h3 className="text-3xl font-bold text-primary mb-8">Want to get involved?</h3>
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="hover:shadow-xl hover:border-accent transition-all duration-300 bg-card">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                            <Handshake className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-primary">Partner with Us</CardTitle>
                        <CardDescription>
                            Join us as a partner to support the growth of the tech ecosystem in Northern Nigeria.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <a href="mailto:partners@arewatechconnect.com">Become a Partner</a>
                        </Button>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-xl hover:border-accent transition-all duration-300 bg-card">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                            <Megaphone className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-primary">Showcase Your Project</CardTitle>
                        <CardDescription>
                            Have an innovative project or startup? Showcase it to our community of developers and enthusiasts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                             <a href="mailto:showcase@arewatechconnect.com">Showcase Now</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICING_TIERS } from "@/lib/constants";
import { CheckIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function Pricing() {
  return (
    <section className="py-24" id="pricing">
      <div className="container px-4 md:px-6">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Simple, Transparent Pricing
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Choose the perfect plan for your voice AI needs
          </p>
        </div>
        <div className="mx-auto grid max-w-screen-lg gap-4 py-8 md:grid-cols-3 lg:gap-8">
          {PRICING_TIERS.map((tier) => (
            <Card key={tier.id} className={tier.highlighted ? 'border-primary shadow-lg' : ''}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={tier.highlighted ? 'default' : 'outline'} asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
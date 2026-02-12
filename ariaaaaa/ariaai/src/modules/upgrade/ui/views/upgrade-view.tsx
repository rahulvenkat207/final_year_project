"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Perfect for trying out Meet AI",
        features: [
            "5 meetings per month",
            "3 AI agents",
            "Basic transcript & summary",
            "Community support",
        ],
        current: true,
    },
    {
        name: "Pro",
        price: "$29",
        description: "For professionals and teams",
        features: [
            "Unlimited meetings",
            "Unlimited AI agents",
            "Advanced transcript & summary",
            "Priority support",
            "Custom agent instructions",
        ],
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large organizations",
        features: [
            "Everything in Pro",
            "Dedicated support",
            "Custom integrations",
            "SLA guarantee",
            "On-premise deployment",
        ],
    },
];

export const UpgradeView = () => {
    const handleUpgrade = (planName: string) => {
        // TODO: Integrate with Polar for payment processing
        if (planName === "Pro") {
            // Redirect to Polar checkout
            window.location.href = "/api/polar/checkout?plan=pro";
        } else if (planName === "Enterprise") {
            // Contact sales
            window.location.href = "mailto:sales@meetai.com";
        }
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Upgrade Your Plan</h1>
                <p className="text-xl text-gray-600">
                    Choose the plan that's right for you
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`relative ${plan.popular ? "border-purple-500 border-2" : ""}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                {plan.price !== "Custom" && (
                                    <span className="text-gray-600">/month</span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-x-2">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={plan.popular ? "default" : "outline"}
                                disabled={plan.current}
                                onClick={() => handleUpgrade(plan.name)}
                            >
                                {plan.current ? "Current Plan" : plan.price === "Custom" ? "Contact Sales" : "Upgrade"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};




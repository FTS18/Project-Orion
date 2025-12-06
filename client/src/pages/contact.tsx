import Header from "@/components/header";
import Footer from "@/components/footer";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send the form data to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "general", message: "" });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Send us an email anytime",
      contact: "support@projectorion.com",
      link: "mailto:support@projectorion.com"
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call us during business hours",
      contact: "+1 (800) 555-0123",
      link: "tel:+18005550123"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 24/7",
      link: "#"
    },
    {
      icon: MapPin,
      title: "Office",
      description: "Visit our headquarters",
      contact: "San Francisco, CA",
      link: "#"
    }
  ];

  const faqItems = [
    {
      question: "What are your business hours?",
      answer: "We're available 24/7 for support. Response times are typically within 2 hours during business hours."
    },
    {
      question: "How quickly will I receive a response?",
      answer: "Email inquiries are typically answered within 24 hours. For urgent issues, please call our support line."
    },
    {
      question: "Can I track my application status?",
      answer: "Yes, you can track your application status in real-time through your account dashboard."
    },
    {
      question: "What should I do if I encounter an error?",
      answer: "Please clear your browser cache, refresh the page, and try again. If the issue persists, contact support with error details."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? We're here to help. Reach out to us through any of these channels.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {contactMethods.map((method, idx) => (
              <a
                key={idx}
                href={method.link}
                className="block"
              >
                <SpotlightCard className="h-full hover:border-primary/50 transition-colors cursor-pointer" spotlightColor="rgba(var(--primary), 0.1)">
                  <CardHeader>
                    <method.icon className="h-8 w-8 text-primary mb-3" aria-hidden="true" />
                    <h3 className="font-semibold text-foreground">{method.title}</h3>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-primary text-sm">{method.contact}</p>
                  </CardContent>
                </SpotlightCard>
              </a>
            ))}
          </div>

          {/* Contact Form and Info */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Form */}
            <div className="md:col-span-2">
              <SpotlightCard spotlightColor="rgba(var(--primary), 0.05)">
                <CardHeader className="border-b">
                  <h2 className="text-2xl font-bold">Send us a Message</h2>
                  <p className="text-muted-foreground mt-2">Fill out the form below and we'll get back to you shortly</p>
                </CardHeader>
                <CardContent className="pt-6">
                  {submitted && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-700 dark:text-green-400">
                      Thank you for your message! We'll be in touch soon.
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="security">Security Concern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <textarea
                        id="message"
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
                        placeholder="Your message..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full gap-2">
                      <Send className="h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </SpotlightCard>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <SpotlightCard className="bg-gradient-to-br from-primary/5 to-accent/5" spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold">Support Hours</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">24/7 Support</p>
                    <p>Available round the clock</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Response Time</p>
                    <p>Within 2 hours (business hours)</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone Support</p>
                    <p>Mon-Fri 9AM-6PM EST</p>
                  </div>
                </CardContent>
              </SpotlightCard>

              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <h3 className="font-semibold">Emergency Support</h3>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="mb-3">For urgent issues requiring immediate assistance:</p>
                  <a href="tel:+18005550123" className="text-primary hover:underline font-medium">
                    Call +1 (800) 555-0123
                  </a>
                </CardContent>
              </SpotlightCard>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <SpotlightCard key={idx} spotlightColor="rgba(var(--primary), 0.05)">
                  <CardHeader>
                    <h3 className="font-semibold text-foreground">{item.question}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

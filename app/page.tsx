import Link from "next/link";
import {
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex items-center justify-center">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              FitLife Gym
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#classes"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Classes
            </Link>
            <Link
              href="#trainers"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Trainers
            </Link>
            <Link
              href="#membership"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Membership
            </Link>
            <Link
              href="#schedule"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Schedule
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              <Link href="#membership">Join Now</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative py-20 md:py-32 overflow-hidden md:flex justify-center">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg"
              alt="Gym Interior"
              className="object-cover w-full h-full opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background to-background/50" />
          </div>
          <div className="container relative">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Transform Your Body,{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Transform Your Life
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                State-of-the-art equipment, expert trainers, and a supportive
                community to help you achieve your fitness goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                >
                  <Link href="#membership">
                    Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Free Trial Pass
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50 md:flex justify-center">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="mb-6 rounded-full bg-primary/10 p-3 w-fit">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">24/7 Access</h3>
                <p className="text-muted-foreground">
                  Train on your schedule with round-the-clock access to our
                  facility.
                </p>
              </div>
              <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="mb-6 rounded-full bg-primary/10 p-3 w-fit">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Expert Trainers</h3>
                <p className="text-muted-foreground">
                  Get personalized guidance from certified fitness
                  professionals.
                </p>
              </div>
              <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="mb-6 rounded-full bg-primary/10 p-3 w-fit">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Equipment</h3>
                <p className="text-muted-foreground">
                  Train with the latest fitness equipment and technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="classes" className="py-20 md:flex justify-center">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-16">
              Featured Classes
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative aspect-square overflow-hidden rounded-xl">
                <img
                  src="https://images.pexels.com/photos/4662438/pexels-photo-4662438.jpeg"
                  alt="Yoga Class"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Yoga Flow
                    </h3>
                    <p className="text-white/90">Find your inner balance</p>
                  </div>
                </div>
              </div>
              <div className="group relative aspect-square overflow-hidden rounded-xl">
                <img
                  src="https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg"
                  alt="HIIT Training"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      HIIT Training
                    </h3>
                    <p className="text-white/90">Push your limits</p>
                  </div>
                </div>
              </div>
              <div className="group relative aspect-square overflow-hidden rounded-xl">
                <img
                  src="https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg"
                  alt="Strength Training"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Strength Training
                    </h3>
                    <p className="text-white/90">Build your power</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="trainers"
          className="py-20 bg-muted/50 md:flex justify-center"
        >
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Expert Trainers</h2>
              <p className="text-muted-foreground">
                Our certified professionals are here to help you achieve your
                fitness goals
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="group bg-card rounded-xl overflow-hidden">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/6456299/pexels-photo-6456299.jpeg"
                    alt="John Doe"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">John Doe</h3>
                  <p className="text-primary font-medium mb-3">
                    Strength & Conditioning
                  </p>
                  <p className="text-muted-foreground text-sm">
                    NASM certified trainer with 8+ years of experience in
                    strength training and athletic performance.
                  </p>
                </div>
              </div>

              <div className="group bg-card rounded-xl overflow-hidden">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/8436431/pexels-photo-8436431.jpeg"
                    alt="Sarah Johnson"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Sarah Johnson</h3>
                  <p className="text-primary font-medium mb-3">
                    Yoga & Flexibility
                  </p>
                  <p className="text-muted-foreground text-sm">
                    RYT-500 certified yoga instructor specializing in vinyasa
                    flow and mobility training.
                  </p>
                </div>
              </div>

              <div className="group bg-card rounded-xl overflow-hidden">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/6922165/pexels-photo-6922165.jpeg"
                    alt="Mike Wilson"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Mike Wilson</h3>
                  <p className="text-primary font-medium mb-3">
                    HIIT & Functional Training
                  </p>
                  <p className="text-muted-foreground text-sm">
                    ACE certified trainer specializing in high-intensity
                    interval training and functional fitness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="membership"
          className="py-20 bg-muted/50 md:flex justify-center"
        >
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Flexible membership options to fit your lifestyle
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-card rounded-xl p-8 border shadow-sm hover:shadow-md transition-all">
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Access to gym floor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Basic equipment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Locker room access</span>
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>

              <div className="bg-gradient-to-b from-primary to-purple-600 rounded-xl p-8 shadow-xl scale-105 text-white">
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$59</span>
                  <span className="text-white/90">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>All Basic features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Group classes included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Personal trainer session</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-primary hover:bg-white/90">
                  Get Started
                </Button>
              </div>

              <div className="bg-card rounded-xl p-8 border shadow-sm hover:shadow-md transition-all">
                <h3 className="text-xl font-bold mb-2">Elite</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$89</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>All Premium features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Unlimited classes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Nutrition consultation</span>
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:flex justify-center">
          <div className="container">
            <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                Start Your Fitness Journey Today
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join our community and transform your life
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                Get Your Free Pass
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/30 md:flex justify-center">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">FitLife Gym</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your premier fitness destination for a stronger, healthier life.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#classes" className="hover:text-primary">
                    Classes
                  </Link>
                </li>
                <li>
                  <Link href="#trainers" className="hover:text-primary">
                    Trainers
                  </Link>
                </li>
                <li>
                  <Link href="#membership" className="hover:text-primary">
                    Membership
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>123 Fitness Street</li>
                <li>New York, NY 10001</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Monday - Friday: 5am - 11pm</li>
                <li>Saturday: 7am - 9pm</li>
                <li>Sunday: 7am - 7pm</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} FitLife Gym. All rights reserved.
      </div>
    </div>
  );
}

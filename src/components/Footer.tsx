import Link from "next/link";
import {
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Github,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  BarChart3,
  Brain,
  Shield,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Forecasters", href: "/forecasters" },
      { label: "Predictions", href: "/predictions" },
      { label: "Rankings", href: "/rankings" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    resources: [
      { label: "Articles", href: "/articles" },
      { label: "Methodology", href: "/methodology" },
      { label: "Getting Started", href: "/auth/signup" },
      { label: "Documentation", href: "/docs" },
      { label: "Support", href: "/support" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Admin Panel", href: "/admin" },
      { label: "Sign In", href: "/auth/signin" },
      { label: "Sign Up", href: "/auth/signup" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Data Protection", href: "#" },
      { label: "Disclaimer", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://x.com", label: "X" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
  ];

  const features = [
    { icon: TrendingUp, label: "Real-time Predictions" },
    { icon: BarChart3, label: "Advanced Analytics" },
    { icon: Brain, label: "AI-Powered Insights" },
    { icon: Shield, label: "Verified Forecasters" },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                Stay Ahead of the Market
              </h3>
              <p className="text-slate-400">
                Get weekly insights and predictions delivered to your inbox
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-w-[250px]"
              />
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Prediction Prism
              </span>
            </Link>
            <p className="text-slate-400 mb-6 pr-4">
              Advanced AI-powered financial forecasting platform helping traders and investors make data-driven decisions with confidence.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 rounded-full text-xs text-slate-300"
                >
                  <feature.icon className="h-3 w-3" />
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
                <a href="mailto:support@predictionprism.com" className="text-slate-300 hover:text-white transition-colors">
                  support@predictionprism.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                <a href="tel:+1234567890" className="text-slate-300 hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Office</p>
                <p className="text-slate-300">
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-400">2,847+</p>
              <p className="text-sm text-slate-500 mt-1">Active Forecasters</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">96.5%</p>
              <p className="text-sm text-slate-500 mt-1">Avg Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">156K+</p>
              <p className="text-sm text-slate-500 mt-1">Predictions Made</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">$2.3B+</p>
              <p className="text-sm text-slate-500 mt-1">Assets Analyzed</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} Prediction Prism Analytics. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-slate-500 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-slate-500 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className="text-slate-500 hover:text-white transition-colors"
              >
                Cookies
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-500">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
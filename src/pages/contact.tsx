"use client";

import { type NextPage } from "next";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare, Clock, Users } from "lucide-react";
import { useState } from "react";
import { api } from "@/utils/api";

const ContactPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });

  // TODO: Implement contact.submit API endpoint
  const contactMutation = {
    mutate: (data: any) => {
      console.log('Contact form submitted:', data);
      // Mock successful response for build
      setTimeout(() => {
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: ""
        });
        setIsLoading(false);
        // Show success message (you might want to use a toast library)
        alert("Message sent! We'll get back to you soon.");
      }, 1000);
    },
    mutateAsync: async (data: any) => {
      console.log('Contact form submitted async:', data);
      // Mock successful async response for build
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Reset form
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            subject: "",
            message: ""
          });
          setIsLoading(false);
          // Show success message (you might want to use a toast library)
          alert("Message sent! We'll get back to you soon.");
          resolve();
        }, 1000);
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // If API endpoint exists, use it
    if (contactMutation.mutateAsync) {
      try {
        await contactMutation.mutateAsync(formData);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Message sent! We'll get back to you soon.");
      setIsLoading(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: "Email",
      description: "Send us an email",
      contact: "hello@predictionprism.com"
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: "Phone",
      description: "Call us directly",
      contact: "+1 (555) 123-4567"
    },
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: "Office",
      description: "Visit our office",
      contact: "123 Finance St, New York, NY 10001"
    }
  ];

  const supportOptions = [
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      title: "General Inquiries",
      description: "Questions about our platform or services",
      response: "24 hours"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Sales & Partnerships",
      description: "Enterprise solutions and partnerships",
      response: "Same day"
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: "Technical Support",
      description: "Help with your account or technical issues",
      response: "2-4 hours"
    }
  ];

  return (
    <>
      <Head>
        <title>Contact Us - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Get in touch with our team. We're here to help with your forecasting and prediction analytics needs."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tight mb-6">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have questions about our platform? Want to discuss a partnership?
                We'd love to hear from you.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <motion.div
                className="lg:col-span-2"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      Send us a Message
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <motion.div
                          className="space-y-2"
                          variants={itemVariants}
                        >
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </motion.div>
                        <motion.div
                          className="space-y-2"
                          variants={itemVariants}
                        >
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </motion.div>
                      </div>

                      <motion.div
                        className="space-y-2"
                        variants={itemVariants}
                      >
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        variants={itemVariants}
                      >
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                        />
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        variants={itemVariants}
                      >
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          className="min-h-[120px]"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Send Message"}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                className="space-y-6"
                variants={itemVariants}
              >
                {/* Contact Information */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Reach out to us through any of these channels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contactInfo.map((info, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-3"
                        variants={itemVariants}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{info.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">{info.description}</p>
                          <p className="text-sm font-medium text-blue-600">{info.contact}</p>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Support Options */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle>Support Options</CardTitle>
                    <CardDescription>
                      Choose the best way to get help
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {supportOptions.map((option, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-3"
                        variants={itemVariants}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{option.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">{option.description}</p>
                          <p className="text-xs text-blue-600 font-medium">
                            Response time: {option.response}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Office Hours */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle>Office Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saturday</span>
                        <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sunday</span>
                        <span className="font-medium">Closed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Additional Info */}
            <motion.div
              className="mt-16 text-center"
              variants={itemVariants}
            >
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Need immediate help?</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    For urgent technical issues or account problems, please email us directly at{" "}
                    <a href="mailto:support@predictionprism.com" className="text-blue-600 font-medium hover:underline">
                      support@predictionprism.com
                    </a>{" "}
                    and we'll respond within 2 hours during business hours.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default ContactPage;
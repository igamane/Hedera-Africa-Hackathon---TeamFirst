"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Plus, CheckCircle, AlertCircle, Building, Wallet, ImageIcon } from "lucide-react"

export default function AdminPage() {
  const [formData, setFormData] = useState({
    clubName: "",
    clubBio: "",
    clubLocation: "",
    clubCategory: "",
    hederaAccountId: "",
    hcsTopicId: "",
    nftCollectionId: "",
    logoFile: null as File | null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, logoFile: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    // Mock submission process
    setTimeout(() => {
      setSubmitStatus("success")
      setIsSubmitting(false)
      // Reset form
      setFormData({
        clubName: "",
        clubBio: "",
        clubLocation: "",
        clubCategory: "",
        hederaAccountId: "",
        hcsTopicId: "",
        nftCollectionId: "",
        logoFile: null,
      })
    }, 2000)
  }

  const categories = ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Championship", "Other"]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Admin Header */}
        <section className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Admin Setup</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Register new football clubs and configure their blockchain integration
              </p>
            </div>
          </div>
        </section>

        {/* Admin Form */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Club Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Club Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clubName">Club Name *</Label>
                      <Input
                        id="clubName"
                        placeholder="e.g., Manchester United FC"
                        value={formData.clubName}
                        onChange={(e) => handleInputChange("clubName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clubLocation">Location *</Label>
                      <Input
                        id="clubLocation"
                        placeholder="e.g., Manchester, England"
                        value={formData.clubLocation}
                        onChange={(e) => handleInputChange("clubLocation", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="clubBio">Club Description *</Label>
                    <Textarea
                      id="clubBio"
                      placeholder="Brief description of the club, its history, and mission..."
                      value={formData.clubBio}
                      onChange={(e) => handleInputChange("clubBio", e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clubCategory">League/Category *</Label>
                      <select
                        id="clubCategory"
                        value={formData.clubCategory}
                        onChange={(e) => handleInputChange("clubCategory", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="logoFile">Club Logo</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="logoFile"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                      {formData.logoFile && (
                        <p className="text-sm text-muted-foreground mt-1">Selected: {formData.logoFile.name}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    Blockchain Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="hederaAccountId">Hedera Account ID *</Label>
                    <Input
                      id="hederaAccountId"
                      placeholder="e.g., 0.0.123456"
                      value={formData.hederaAccountId}
                      onChange={(e) => handleInputChange("hederaAccountId", e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      The Hedera account where donations will be received
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="hcsTopicId">HCS Topic ID</Label>
                      <Input
                        id="hcsTopicId"
                        placeholder="e.g., 0.0.789012"
                        value={formData.hcsTopicId}
                        onChange={(e) => handleInputChange("hcsTopicId", e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">For real-time donation feed (optional)</p>
                    </div>
                    <div>
                      <Label htmlFor="nftCollectionId">NFT Collection ID</Label>
                      <Input
                        id="nftCollectionId"
                        placeholder="e.g., 0.0.345678"
                        value={formData.nftCollectionId}
                        onChange={(e) => handleInputChange("nftCollectionId", e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">For supporter badges (optional)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">* Required fields must be completed</div>

                    <div className="flex items-center space-x-4">
                      {submitStatus === "success" && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">Club registered successfully!</span>
                        </div>
                      )}

                      {submitStatus === "error" && (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">Registration failed. Please try again.</span>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting || !formData.clubName || !formData.hederaAccountId}
                        className="flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Register Club
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>

            {/* Help Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Setup Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                        1
                      </div>
                      <h3 className="font-semibold">Create Hedera Account</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Set up a Hedera account for the club to receive donations
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                        2
                      </div>
                      <h3 className="font-semibold">Configure HCS Topic</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Optional: Create HCS topic for real-time donation feeds
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                        3
                      </div>
                      <h3 className="font-semibold">Setup NFT Collection</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Optional: Create NFT collection for supporter badges
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

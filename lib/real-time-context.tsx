"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Donation {
  id: string
  clubId: string
  clubName: string
  fanId: string
  amount: number
  timestamp: string
  txId: string
}

interface ClubStats {
  clubId: string
  totalRaised: number
  supporters: number
  recentDonations: number
}

interface RealTimeContextType {
  donations: Donation[]
  clubStats: Map<string, ClubStats>
  isConnected: boolean
  addDonation: (donation: Omit<Donation, "id" | "timestamp">) => void
  updateClubStats: (clubId: string, stats: Partial<ClubStats>) => void
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const [donations, setDonations] = useState<Donation[]>([])
  const [clubStats, setClubStats] = useState<Map<string, ClubStats>>(new Map())
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate WebSocket connection for real-time updates
    const connectToRealTime = () => {
      console.log("Connecting to real-time feed...")
      setIsConnected(true)

      // Simulate periodic donation updates
      const interval = setInterval(() => {
        // Generate mock donation
        const mockDonation: Donation = {
          id: `donation-${Date.now()}`,
          clubId: "1",
          clubName: "Manchester United FC",
          fanId: `Fan#${Math.floor(Math.random() * 9999)}`,
          amount: Math.floor(Math.random() * 500) + 10,
          timestamp: new Date().toISOString(),
          txId: `0.0.123456@${Date.now()}`,
        }

        setDonations((prev) => [mockDonation, ...prev.slice(0, 19)]) // Keep last 20 donations

        // Update club stats
        setClubStats((prev) => {
          const newStats = new Map(prev)
          const currentStats = newStats.get("1") || {
            clubId: "1",
            totalRaised: 45678,
            supporters: 1234,
            recentDonations: 0,
          }

          newStats.set("1", {
            ...currentStats,
            totalRaised: currentStats.totalRaised + mockDonation.amount,
            recentDonations: currentStats.recentDonations + 1,
          })

          return newStats
        })
      }, 15000) // New donation every 15 seconds

      return () => {
        clearInterval(interval)
        setIsConnected(false)
      }
    }

    const cleanup = connectToRealTime()
    return cleanup
  }, [])

  const addDonation = (donationData: Omit<Donation, "id" | "timestamp">) => {
    const donation: Donation = {
      ...donationData,
      id: `donation-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    setDonations((prev) => [donation, ...prev.slice(0, 19)])

    // Update club stats
    setClubStats((prev) => {
      const newStats = new Map(prev)
      const currentStats = newStats.get(donation.clubId) || {
        clubId: donation.clubId,
        totalRaised: 0,
        supporters: 0,
        recentDonations: 0,
      }

      newStats.set(donation.clubId, {
        ...currentStats,
        totalRaised: currentStats.totalRaised + donation.amount,
        recentDonations: currentStats.recentDonations + 1,
      })

      return newStats
    })
  }

  const updateClubStats = (clubId: string, stats: Partial<ClubStats>) => {
    setClubStats((prev) => {
      const newStats = new Map(prev)
      const currentStats = newStats.get(clubId) || {
        clubId,
        totalRaised: 0,
        supporters: 0,
        recentDonations: 0,
      }

      newStats.set(clubId, { ...currentStats, ...stats })
      return newStats
    })
  }

  const value: RealTimeContextType = {
    donations,
    clubStats,
    isConnected,
    addDonation,
    updateClubStats,
  }

  return <RealTimeContext.Provider value={value}>{children}</RealTimeContext.Provider>
}

export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error("useRealTime must be used within a RealTimeProvider")
  }
  return context
}

import FloatingSymbols from "@/components/floating-symbols"
import { Github, Linkedin, Twitter } from "lucide-react"

const teamMembers = [
  {
    name: "Alex Johnson",
    role: "Founder & CEO",
    bio: "Blockchain enthusiast with 10+ years in fintech. Previously at Coinbase and Ripple.",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "Sarah Chen",
    role: "CTO",
    bio: "Former lead developer at Ethereum Foundation. Expert in smart contract security and cross-chain protocols.",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "Michael Rodriguez",
    role: "Head of Product",
    bio: "Product leader with experience at top DeFi projects. Passionate about creating intuitive user experiences.",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "Priya Patel",
    role: "Lead Engineer",
    bio: "Full-stack developer specializing in blockchain infrastructure. Contributor to multiple open-source projects.",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#09122C] to-black relative overflow-hidden pt-20">
      <FloatingSymbols />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#BE3144] mb-10 text-center">Meet Our Team</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center text-white"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-[#BE3144]/20">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold mb-1">{member.name}</h2>
              <p className="text-[#BE3144] mb-3">{member.role}</p>
              <p className="text-sm text-center mb-4">{member.bio}</p>
              <div className="flex space-x-3 mt-auto">
                <a href="#" className="text-white/70 hover:text-white">
                  <Twitter size={18} />
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <Linkedin size={18} />
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <Github size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}


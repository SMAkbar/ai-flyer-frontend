'use client';
import React from "react";
import { tokens } from "@/components/theme/tokens";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { DashboardStat } from "@/components/team/DashboardStat";

export default function ThemePage() {
  return (
    <main style={{ backgroundColor: tokens.bgBase, color: tokens.textPrimary, minHeight: "100vh" }}>
      <div
        style={{
          width: "90%",
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "32px 24px",
          display: "grid",
          gap: "32px",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "24px",
            marginBottom: "8px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "40px",
                lineHeight: 1.2,
                fontWeight: 700,
                color: tokens.textPrimary,
                letterSpacing: "-0.02em",
                marginBottom: "12px",
              }}
            >
              Theme
            </h1>
            <p
              style={{
                marginTop: 0,
                color: tokens.textSecondary,
                fontSize: "16px",
                lineHeight: 1.5,
                maxWidth: "600px",
              }}
            >
              Explore our design system and component gallery showcasing modern UI elements and design patterns.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Get in touch
              </span>
            </Button>
            <Button variant="secondary">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download profile
              </span>
            </Button>
          </div>
        </header>

        <Section title="Team Members" subtitle="The talented people behind our success">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "20px",
            }}
          >
            <TeamMemberCard name="Ava Johnson" role="Product Designer" />
            <TeamMemberCard name="Liam Chen" role="Frontend Engineer" />
            <TeamMemberCard name="Noah Patel" role="Backend Engineer" />
            <TeamMemberCard name="Mia Garcia" role="UX Researcher" />
            <TeamMemberCard name="Emma Wilson" role="DevOps Engineer" />
            <TeamMemberCard name="James Brown" role="Data Scientist" />
          </div>
        </Section>

        <Section title="Component Gallery" subtitle="UI elements and icons">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: "20px",
            }}
          >
            <Card
              style={{
                padding: "24px",
                backgroundColor: tokens.bgElevated,
                border: `1px solid ${tokens.border}`,
                borderRadius: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: tokens.textPrimary,
                  marginBottom: "16px",
                  marginTop: 0,
                }}
              >
                Icons
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  padding: "16px",
                  backgroundColor: tokens.bgHover,
                  borderRadius: "12px",
                  border: `1px solid ${tokens.border}`,
                }}
              >
                <Icon path="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-4.418 0-8 2.239-8 5v3h16v-3c0-2.761-3.582-5-8-5Z" />
                <Icon path="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 21.49 21.49 20l-5.99-6Z M10.5 15A4.5 4.5 0 1 1 10.5 6a4.5 4.5 0 0 1 0 9Z" />
                <Icon path="M8 5v14l11-7L8 5Z" />
                <Icon path="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" />
                <Icon path="M9 16.17 4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z" color={tokens.success} />
                <Icon path="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" color={tokens.warning} />
              </div>
            </Card>

            <Card
              style={{
                padding: "24px",
                backgroundColor: tokens.bgElevated,
                border: `1px solid ${tokens.border}`,
                borderRadius: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: tokens.textPrimary,
                  marginBottom: "20px",
                  marginTop: 0,
                }}
              >
                Form Elements
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label
                    htmlFor="search"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: tokens.textPrimary,
                    }}
                  >
                    Search
                  </label>
                  <div style={{ position: "relative" }}>
                    <Input id="search" placeholder="Search the catalog" />
                    <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                      <Icon path="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 21.49 21.49 20l-5.99-6Z M10.5 15A4.5 4.5 0 1 1 10.5 6a4.5 4.5 0 0 1 0 9Z" size={18} color={tokens.textMuted} />
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: tokens.textPrimary,
                    }}
                  >
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="you@company.com" />
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                  <Button>Primary action</Button>
                  <Button variant="secondary">Secondary action</Button>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <Section title="Cards & Content" subtitle="Interactive cards with hover effects">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "20px",
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} hoverElevate>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      backgroundColor: tokens.bgHover,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${tokens.border}`,
                    }}
                  >
                    <Icon path="M8 5v14l11-7L8 5Z" color={tokens.accent} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "15px", color: tokens.textPrimary }}>Featured Item {i}</div>
                </div>
                <div style={{ color: tokens.textSecondary, fontSize: "14px", lineHeight: 1.5 }}>
                  Cinematic description for the featured content card in a dark UI.
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Dashboard Metrics" subtitle="Key performance indicators">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
              gap: "20px",
            }}
          >
            <DashboardStat label="Active Users" value="12,842" trend="up" color={tokens.textPrimary} />
            <DashboardStat label="Conversion Rate" value="4.8%" trend="up" color={tokens.success} />
            <DashboardStat label="Churn Rate" value="2.3%" trend="down" color={tokens.danger} />
            <DashboardStat label="Support Tickets" value="128" color={tokens.warning} />
            <DashboardStat label="Revenue" value="$142K" trend="up" color={tokens.accent} />
            <DashboardStat label="Growth" value="+12%" trend="up" color={tokens.success} />
          </div>
        </Section>

        <footer
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.border}`,
            borderRadius: "16px",
            padding: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
            marginTop: "8px",
          }}
        >
          <div style={{ color: tokens.textSecondary, fontSize: "15px" }}>
            Built with modern design principles and a focus on user experience.
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="secondary">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
                View Docs
              </span>
            </Button>
            <Button>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Start a project
              </span>
            </Button>
          </div>
        </footer>
      </div>
    </main>
  );
}

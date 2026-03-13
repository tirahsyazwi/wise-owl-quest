import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MissionCard from "@/components/MissionCard";
import { Mission } from "@/data/missionBank";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/components/NovaOwl", () => ({
  default: ({ message }: any) => <div data-testid="nova-owl">{message}</div>,
}));

vi.mock("@/components/RewardBadge", () => ({
  default: ({ coins, xp }: any) => <div data-testid="reward-badge">{coins} coins, {xp} XP</div>,
}));

const testMission: Mission = {
  id: "test-1",
  title: "Test Mission",
  type: "logic",
  zone: "arrival",
  difficulty: 2,
  question: "What is 2 + 2?",
  hint: "Think about counting!",
  options: [
    { id: "a", label: "3", correct: false },
    { id: "b", label: "4", correct: true },
    { id: "c", label: "5", correct: false },
    { id: "d", label: "6", correct: false },
  ],
  reward: { coins: 10, xp: 20 },
  mapPosition: { x: 50, y: 50 },
};

describe("MissionCard", () => {
  it("renders mission title and question", () => {
    render(<MissionCard mission={testMission} />);
    expect(screen.getByText("Test Mission")).toBeInTheDocument();
    expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
  });

  it("renders all answer options", () => {
    render(<MissionCard mission={testMission} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("renders difficulty level indicator", () => {
    render(<MissionCard mission={testMission} />);
    expect(screen.getByText("Lv.2")).toBeInTheDocument();
  });

  it("renders type label", () => {
    render(<MissionCard mission={testMission} />);
    expect(screen.getByText("Logic")).toBeInTheDocument();
  });

  it("disables submit button when no option selected", () => {
    render(<MissionCard mission={testMission} />);
    const submitBtn = screen.getByText("Check Answer");
    expect(submitBtn).toBeDisabled();
  });

  it("enables submit button after selecting an option", () => {
    render(<MissionCard mission={testMission} />);
    fireEvent.click(screen.getByText("4"));
    const submitBtn = screen.getByText("Check Answer");
    expect(submitBtn).not.toBeDisabled();
  });

  it("shows Nova message after correct answer", () => {
    render(<MissionCard mission={testMission} />);
    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("Check Answer"));
    expect(screen.getByTestId("nova-owl")).toBeInTheDocument();
  });

  it("shows Try Again button after wrong answer", () => {
    render(<MissionCard mission={testMission} />);
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("Check Answer"));
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("shows hint after wrong answer and retry", () => {
    render(<MissionCard mission={testMission} />);
    // First wrong attempt
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("Check Answer"));
    // Reset
    fireEvent.click(screen.getByText("Try Again"));
    expect(screen.getByText(/Think about counting!/)).toBeInTheDocument();
  });

  it("calls onComplete with correct result data", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<MissionCard mission={testMission} onComplete={onComplete} />);
    
    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("Check Answer"));
    
    // Wait for reward to show
    vi.advanceTimersByTime(1000);
    
    // Find and click continue button
    const continueBtn = screen.getByText("Continue →");
    fireEvent.click(continueBtn);
    
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        missionId: "test-1",
        missionType: "logic",
        difficulty: 2,
        attempts: 1,
        hintsUsed: 0,
        coins: 10,
        xp: 20,
      })
    );
    vi.useRealTimers();
  });

  it("renders default mission when no mission prop provided", () => {
    render(<MissionCard />);
    expect(screen.getByText("Broken Bridge")).toBeInTheDocument();
  });

  it("prevents selecting options after submission", () => {
    render(<MissionCard mission={testMission} />);
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("Check Answer"));
    // All option buttons should be disabled
    const buttons = screen.getAllByRole("button");
    const optionButtons = buttons.filter(b => ["3", "4", "5", "6"].includes(b.textContent || ""));
    optionButtons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });
});

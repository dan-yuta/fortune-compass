import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LoadingState from "@/components/fortune/LoadingState";

// Mock next/link
jest.mock("next/link", () => {
  function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  }
  return MockLink;
});

describe("LoadingState", () => {
  it("renders loading text", () => {
    render(<LoadingState />);
    expect(screen.getByText("占っています...")).toBeInTheDocument();
  });

  it("has role=status for accessibility", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has aria-live=polite", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("includes back navigation link", () => {
    render(<LoadingState />);
    const backLink = screen.getByText("占い一覧に戻る");
    expect(backLink.closest("a")).toHaveAttribute("href", "/fortune");
  });
});

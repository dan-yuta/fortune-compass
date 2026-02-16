import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorState from "@/components/fortune/ErrorState";

// Mock next/link
jest.mock("next/link", () => {
  function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  }
  return MockLink;
});

describe("ErrorState", () => {
  const mockRetry = jest.fn();

  beforeEach(() => {
    mockRetry.mockClear();
  });

  it("renders default error message", () => {
    render(<ErrorState onRetry={mockRetry} />);
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText("占い結果の取得に失敗しました。もう一度お試しください。")).toBeInTheDocument();
  });

  it("renders custom error message", () => {
    render(<ErrorState onRetry={mockRetry} message="カスタムエラー" />);
    expect(screen.getByText("カスタムエラー")).toBeInTheDocument();
  });

  it("calls onRetry when retry button clicked", () => {
    render(<ErrorState onRetry={mockRetry} />);
    fireEvent.click(screen.getByText("もう一度試す"));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("has role=alert for accessibility", () => {
    render(<ErrorState onRetry={mockRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("includes back navigation link", () => {
    render(<ErrorState onRetry={mockRetry} />);
    const backLink = screen.getByText("占い一覧に戻る");
    expect(backLink.closest("a")).toHaveAttribute("href", "/fortune");
  });
});

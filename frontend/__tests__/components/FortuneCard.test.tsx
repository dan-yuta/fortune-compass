import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import FortuneCard from "@/components/fortune/FortuneCard";
import { Star } from "lucide-react";

// Mock next/link
jest.mock("next/link", () => {
  function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  }
  return MockLink;
});

describe("FortuneCard", () => {
  it("renders title and description", () => {
    render(
      <FortuneCard
        title="星座占い"
        icon={Star}
        description="テスト説明"
        href="/fortune/zodiac"
      />
    );
    expect(screen.getByText("星座占い")).toBeInTheDocument();
    expect(screen.getByText("テスト説明")).toBeInTheDocument();
  });

  it("renders as a link when not disabled", () => {
    render(
      <FortuneCard
        title="星座占い"
        icon={Star}
        description="テスト"
        href="/fortune/zodiac"
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/fortune/zodiac");
  });

  it("renders disabled state with message", () => {
    render(
      <FortuneCard
        title="血液型占い"
        icon={Star}
        description="テスト"
        href="/fortune/blood-type"
        disabled={true}
        disabledMessage="血液型が未設定です"
      />
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("血液型が未設定です")).toBeInTheDocument();
  });

  it("has aria-disabled on disabled card", () => {
    const { container } = render(
      <FortuneCard
        title="テスト"
        icon={Star}
        description="テスト"
        href="/test"
        disabled={true}
      />
    );
    expect(container.firstChild).toHaveAttribute("aria-disabled", "true");
  });
});

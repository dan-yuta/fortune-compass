import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";

describe("ScoreDisplay", () => {
  it("renders 5 stars", () => {
    const { container } = render(<ScoreDisplay score={3} />);
    const stars = container.querySelectorAll("svg");
    expect(stars).toHaveLength(5);
  });

  it("displays correct aria-label for score", () => {
    render(<ScoreDisplay score={4} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "スコア: 4点（5点満点）"
    );
  });

  it("clamps score to 0-5 range", () => {
    render(<ScoreDisplay score={7} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "スコア: 5点（5点満点）"
    );
  });

  it("clamps negative score to 0", () => {
    render(<ScoreDisplay score={-2} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "スコア: 0点（5点満点）"
    );
  });

  it("rounds decimal scores", () => {
    render(<ScoreDisplay score={3.7} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "スコア: 4点（5点満点）"
    );
  });
});

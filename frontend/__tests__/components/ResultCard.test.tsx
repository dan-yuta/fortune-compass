import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ResultCard from "@/components/fortune/ResultCard";

describe("ResultCard", () => {
  it("renders title and children", () => {
    render(
      <ResultCard title="テストタイトル">
        <p>テスト内容</p>
      </ResultCard>
    );
    expect(screen.getByText("テストタイトル")).toBeInTheDocument();
    expect(screen.getByText("テスト内容")).toBeInTheDocument();
  });

  it("uses section element for semantic structure", () => {
    const { container } = render(
      <ResultCard title="セクション">
        <span>内容</span>
      </ResultCard>
    );
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders h3 heading", () => {
    render(
      <ResultCard title="見出し">
        <span>本文</span>
      </ResultCard>
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("見出し");
  });
});

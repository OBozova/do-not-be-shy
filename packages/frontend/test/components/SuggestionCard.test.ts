import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SuggestionCard from "../../src/components/SuggestionCard.vue";

describe("SuggestionCard", () => {
  it("renders the title and each item", () => {
    const wrapper = mount(SuggestionCard, {
      props: { title: "Openers", items: ["Hi there!", "How's your day going?"] },
    });

    expect(wrapper.find("h3").text()).toBe("Openers");
    const items = wrapper.findAll("li");
    expect(items).toHaveLength(2);
    expect(items[0]?.text()).toBe("Hi there!");
    expect(items[1]?.text()).toBe("How's your day going?");
  });

  it("renders an empty list when there are no items", () => {
    const wrapper = mount(SuggestionCard, { props: { title: "Jokes", items: [] } });

    expect(wrapper.findAll("li")).toHaveLength(0);
  });
});

/**
 * A Scenario is the thing a user is preparing to walk into — a job interview,
 * a first date, a networking event. It is the sole input to the domain.
 */
export class Scenario {
  private constructor(public readonly description: string) {}

  static fromDescription(rawDescription: string): Scenario {
    const description = rawDescription.trim();
    if (description.length === 0) {
      throw new InvalidScenarioError("Scenario description cannot be empty.");
    }
    if (description.length > 2000) {
      throw new InvalidScenarioError(
        "Scenario description is too long (max 2000 characters).",
      );
    }
    return new Scenario(description);
  }
}

export class InvalidScenarioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidScenarioError";
  }
}

import { act, render as rtlRender, screen } from "@testing-library/react";
import user from "@testing-library/user-event";

import MyFormComponent from "./MyFormComponent";

function render(ui) {
  const utils = rtlRender(ui);
  function submit() {
    const submitTrigger = screen.getByRole("button", { name: /submit/i });

    user.click(submitTrigger);
  }
  function setName(name = "Name") {
    const nameField = screen.getByPlaceholderText(/name/i);

    user.clear(nameField);
    user.type(nameField, name);
  }
  function setEmail(email = "example@example.com") {
    const emailField = screen.getByPlaceholderText(/email/i);

    user.clear(emailField);
    user.type(emailField, email);
  }
  function acceptTerms() {
    const termsField = screen.getByRole("checkbox");

    user.click(termsField);
  }
  function setGender(gender = "male") {
    const genderOptions = screen.getAllByRole("radio");
    const maleOption = genderOptions.find(
      (current) => current.getAttribute("value") === "male",
    );

    const femaleOption = genderOptions.find(
      (current) => current.getAttribute("value") === "female",
    );

    if (gender === "male") {
      user.click(maleOption);
    } else if (gender === "female") {
      user.click(femaleOption);
    }
  }

  function setAll({ name, email, gender, termsAccepted = true } = {}) {
    setName(name);
    setEmail(email);
    setGender(gender);
    if (termsAccepted) {
      acceptTerms();
    }
  }

  return {
    ...utils,
    setName,
    setEmail,
    setGender,
    acceptTerms,
    setAll,
    submit,
  };
}

describe("MyFormComponent", () => {
  // beforeAll(() => {
  //   jest.spyOn(console, "log").mockImplementation(/** do nothing */);
  // });
  //
  // afterAll(() => {
  //   jest.restoreAllMocks();
  // });
  //
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays name error when the name field is empty", () => {
    const { submit } = render(<MyFormComponent />);
    submit();

    expect(
      screen.getByText("Name must be at least 3 characters."),
    ).toBeInTheDocument();
  });

  it("displays email error when the email field is invalid", () => {
    const { setEmail, submit } = render(<MyFormComponent />);
    act(() => {
      setEmail("person.email.com");
    });
    submit();

    expect(screen.getByText("Email must be valid.")).toBeInTheDocument();
  });

  it("displays terms agreement error when the checkbox is un-ticked", () => {
    render(<MyFormComponent />);

    const submitTrigger = screen.getByRole("button", { name: /submit/i });

    user.click(submitTrigger);

    const error = screen.getByText("You must agree to the terms.");

    expect(error).toBeInTheDocument();
  });

  it("displays gender selection error when gender is not selected", () => {
    const { submit } = render(<MyFormComponent />);
    submit();

    expect(screen.getByText("You must select a gender.")).toBeInTheDocument();
  });

  it("displays name error when the name is too short", () => {
    const { submit, setName } = render(<MyFormComponent />);
    act(() => {
      setName("N");
    });
    submit();

    expect(
      screen.getByText("Name must be at least 3 characters."),
    ).toBeInTheDocument();
  });

  it("displays no errors for valid form submission", () => {
    const { submit, setAll } = render(<MyFormComponent />);
    act(() => {
      setAll();
    });
    submit();

    expect(
      screen.queryByText("Name must be at least 3 characters."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Email must be valid.")).not.toBeInTheDocument();
    expect(
      screen.queryByText("You must agree to the terms."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("You must select a gender."),
    ).not.toBeInTheDocument();
  });

  it("accepts veeeeeery long names", () => {
    const { submit, setName } = render(<MyFormComponent />);
    act(() => {
      setName("x".repeat(30));
    });
    submit();

    expect(
      screen.queryByText("Name must be at least 3 characters."),
    ).not.toBeInTheDocument();
  });

  it("handles complex emails", () => {
    const { submit, setEmail } = render(<MyFormComponent />);
    act(() => {
      setEmail("test.name+alias@example.co.uk");
    });
    submit();

    expect(screen.queryByText("Email must be valid.")).not.toBeInTheDocument();
  });

  it("respects gender updates", () => {
    const submissionHandler = jest.fn();
    const targetGender = "female";
    const currentGender = "male";

    jest.spyOn(console, "log").mockImplementation(submissionHandler);
    const { submit, setAll, setGender } = render(<MyFormComponent />);

    act(() => {
      setAll({ gender: currentGender });
    });
    act(() => {
      setGender(targetGender);
    });
    submit();

    expect(submissionHandler).toHaveBeenCalledTimes(1);
    expect(submissionHandler).toHaveBeenCalledWith(
      expect.objectContaining({ gender: targetGender }),
    );
  });

  it("allows form re-submission", () => {
    const submissionHandler = jest.fn();
    const targetName = "New Name";

    jest.spyOn(console, "log").mockImplementation(submissionHandler);
    const { submit, setAll } = render(<MyFormComponent />);

    act(() => {
      setAll({ name: "prev name" });
    });

    submit();

    act(() => {
      setAll({ name: targetName });
    });

    submit();

    expect(submissionHandler).toHaveBeenCalledTimes(2);
    expect(submissionHandler).toHaveBeenCalledWith(
      expect.objectContaining({ name: targetName }),
    );
  });
});

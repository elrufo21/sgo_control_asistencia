import {
  forwardRef,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CompositionEvent,
} from "react";

const TextInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(function TextInput({
  type = "text",
  value,
  defaultValue,
  onChange,
  onCompositionEnd,
  autoComplete,
  ...props
}, ref) {
  const uppercase =
    type !== "password" &&
    ["text", "search", "email", "tel", "url"].includes(type);
  const format = <T,>(input: T) =>
    uppercase && typeof input === "string" ? input.toUpperCase() : input;

  function convertir(
    event: ChangeEvent<HTMLInputElement> | CompositionEvent<HTMLInputElement>,
  ) {
    if (
      uppercase &&
      !(
        event.nativeEvent instanceof InputEvent && event.nativeEvent.isComposing
      )
    ) {
      const input = event.currentTarget;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const previous = input.value;
      input.value = previous.toUpperCase();
      if (start !== null && end !== null) {
        input.setSelectionRange(
          previous.slice(0, start).toUpperCase().length,
          previous.slice(0, end).toUpperCase().length,
        );
      }
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    convertir(event);
    onChange?.(event);
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    convertir(event);
    onChange?.({ ...event, target: event.currentTarget });
    onCompositionEnd?.(event);
  }

  return (
    <input
      {...props}
      ref={ref}
      type={type}
      autoComplete={type === "hidden" ? undefined : autoComplete ?? (uppercase || type === "number" ? "one-time-code" : "off")}
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-lpignore="true"
      data-1p-ignore="true"
      data-bwignore="true"
      data-form-type="other"
      value={format(value)}
      defaultValue={format(defaultValue)}
      onChange={handleChange}
      onCompositionEnd={handleCompositionEnd}
    />
  );
});
export default TextInput;

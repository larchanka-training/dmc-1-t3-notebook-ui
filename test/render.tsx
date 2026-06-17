/**
 * Canonical test render entry point — spec QA-UI-COMPONENT-TEST-INFRA §6.8
 *
 * Re-exports the project's real renderWithProviders as the default `render`
 * so tests can always do:
 *
 *   import { render, screen } from "@test/render";
 *
 * When new providers are added (Router, additional Zustand slices, Theme…),
 * update renderWithProviders.tsx — this file acts as the stable public API.
 *
 * Also re-exports everything from @testing-library/react so test files can
 * use a single import source for both render utilities and query helpers.
 */
export { renderWithProviders as render } from "./renderWithProviders";
export {
  screen,
  fireEvent,
  within,
  waitFor,
  waitForElementToBeRemoved,
  act,
  cleanup,
  prettyDOM,
} from "@testing-library/react";

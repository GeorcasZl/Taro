export interface AddSearchAction {
  id: string;
  label: string;
  description: string;
}

export const MVP1_ADD_SEARCH_ACTIONS: AddSearchAction[] = [
  {
    id: "set-rainy-street-background",
    label: "Set rainy street background",
    description: "Adds a project background resource and a visible stage change at the cursor."
  }
];

// components/MealCard/QuickAddSection.js
import QuickAddChips from "../Menu/QuickAddChips";

export default function QuickAddSection({ suggestionsExt, rest, onQuickAdd }) {
  return (
    <div className="mb-3">
      {suggestionsExt.VEGETABLE_SIDE && (
        <QuickAddChips
          type="VEGETABLE_SIDE"
          options={suggestionsExt.VEGETABLE_SIDE}
          rest={rest}
          onQuickAdd={onQuickAdd}
        />
      )}
      {suggestionsExt.DAIRY && (
        <QuickAddChips
          type="DAIRY"
          options={suggestionsExt.DAIRY}
          rest={rest}
          onQuickAdd={onQuickAdd}
        />
      )}
      {suggestionsExt.FRUIT_SIDE && (
        <QuickAddChips
          type="FRUIT_SIDE"
          options={suggestionsExt.FRUIT_SIDE}
          rest={rest}
          onQuickAdd={onQuickAdd}
        />
      )}
      {suggestionsExt.PROTEIN && (
        <QuickAddChips
          type="PROTEIN"
          options={suggestionsExt.PROTEIN}
          rest={rest}
          onQuickAdd={onQuickAdd}
        />
      )}
      {suggestionsExt.BREAKFAST_PROTEIN && (
        <QuickAddChips
          type="BREAKFAST_PROTEIN"
          options={suggestionsExt.BREAKFAST_PROTEIN}
          rest={rest}
          onQuickAdd={onQuickAdd}
        />
      )}
      {suggestionsExt.CARB && (
        <QuickAddChips
          type="CARB"
          options={suggestionsExt.CARB}
          rest={rest}
          onQuickAdd={onQuickAdd}
        />
      )}
    </div>
  );
}

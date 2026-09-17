import type { FormEvent } from "react";

type MarkerFormProps = {
      step: number;
      title: string;
      description: string;
      onTitleChange: (value: string) => void;
      onDescriptionChange: (value: string) => void;
      onSave: (event: FormEvent<HTMLFormElement>) => void;
      onCancel: () => void;
};

export function MarkerForm({ step, title, description, onTitleChange, onDescriptionChange, onSave, onCancel }: MarkerFormProps) {
      return <section aria-label="Add timeline marker" className="marker-form"><div><p className="eyebrow">Frame {step}</p><h2>Add marker</h2></div><form onSubmit={onSave}><label>Title<input autoFocus onChange={(event) => onTitleChange(event.target.value)} required value={title} /></label><label>Description <span>(optional)</span><textarea onChange={(event) => onDescriptionChange(event.target.value)} value={description} /></label><div className="marker-form-actions"><button onClick={onCancel} type="button">Cancel</button><button className="primary-button" type="submit">Save marker</button></div></form></section>;
}

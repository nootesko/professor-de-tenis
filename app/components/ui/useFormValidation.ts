'use client';
import { useCallback, useMemo, useState } from 'react';
import { applyMask, type MaskType, type Validator } from './validators';

export type FieldSpec = { validators?: Validator[]; mask?: MaskType };

export function useFormValidation<T extends Record<string, unknown>>(
  initial: T,
  specs: Partial<Record<keyof T, FieldSpec>>,
) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (key: keyof T, v: unknown): string | null => {
      const spec = specs[key];
      if (!spec?.validators) return null;
      for (const vl of spec.validators) {
        const err = vl(String(v ?? ''));
        if (err) return err;
      }
      return null;
    },
    [specs],
  );

  const setField = useCallback(
    (key: keyof T) =>
      (e: unknown) => {
        const raw =
          e && typeof e === 'object' && 'target' in e
            ? (e as { target: { value: string } }).target.value
            : (e as string);
        const spec = specs[key];
        const masked = spec?.mask && spec.mask !== 'none' ? applyMask(String(raw ?? ''), spec.mask) : raw;
        setValues((prev) => ({ ...prev, [key]: masked as T[keyof T] }));
        if (touched[key]) {
          const err = validateField(key, masked);
          setErrors((prev) => ({ ...prev, [key]: err ?? undefined }));
        }
      },
    [specs, touched, validateField],
  );

  const onBlur = useCallback(
    (key: keyof T) => () => {
      setTouched((p) => ({ ...p, [key]: true }));
      const err = validateField(key, values[key]);
      setErrors((p) => ({ ...p, [key]: err ?? undefined }));
    },
    [validateField, values],
  );

  const fieldProps = useCallback(
    (key: keyof T) => ({
      value: (values[key] ?? '') as string,
      onChange: setField(key),
      onBlur: onBlur(key),
      error: touched[key] ? errors[key] : undefined,
    }),
    [values, setField, onBlur, errors, touched],
  );

  const isValid = useMemo(() => {
    for (const key of Object.keys(specs) as (keyof T)[]) {
      if (validateField(key, values[key])) return false;
    }
    return true;
  }, [specs, values, validateField]);

  const validateAll = useCallback(() => {
    const next: Partial<Record<keyof T, string>> = {};
    const nextTouched: Partial<Record<keyof T, boolean>> = {};
    let ok = true;
    for (const key of Object.keys(specs) as (keyof T)[]) {
      nextTouched[key] = true;
      const err = validateField(key, values[key]);
      if (err) {
        next[key] = err;
        ok = false;
      }
    }
    setErrors(next);
    setTouched((p) => ({ ...p, ...nextTouched }));
    return ok;
  }, [specs, values, validateField]);

  return { values, setValues, errors, touched, setField, onBlur, fieldProps, isValid, validateAll };
}

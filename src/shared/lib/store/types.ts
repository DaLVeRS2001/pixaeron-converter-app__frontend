type TThunkConfig<TExtra, RejectValue = string> = {
  state: RootState;
  dispatch: AppDispatch;
  extra: TExtra;
  rejectValue: RejectValue;
};

export type { TThunkConfig };

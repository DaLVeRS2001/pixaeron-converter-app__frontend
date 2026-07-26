import { useDispatch, useSelector } from 'react-redux';

const useAppDispatch = useDispatch.withTypes<AppDispatch>();

const useAppSelector = useSelector.withTypes<RootState>();

export { useAppDispatch, useAppSelector };

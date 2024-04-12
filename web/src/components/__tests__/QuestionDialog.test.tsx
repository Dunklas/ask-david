import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import QuestionDialog from '../QuestionDialog';

it('should call onClose', async () => {
    const onClose = vi.fn();
    render(<QuestionDialog onClose={onClose} onSubmit={() => {}}/>);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Cancel'}));

    expect(onClose).toHaveBeenCalledOnce();
})
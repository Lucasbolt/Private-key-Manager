import inquirer from 'inquirer';

export async function getPassword(): Promise<string> {
    const response = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'Enter your password:',
            mask: '*',
        },
    ]);

    return response.password;
}

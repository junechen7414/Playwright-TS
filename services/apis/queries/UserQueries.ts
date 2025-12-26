export const GET_USER_DETAIL_QUERY = `
	query GetUserDetail($userId: ID!) {
		user(id: $userId) {
			id
			name
			avatar
		}
	}
`;

// src/Components/GraphQLDemo.jsx
import React, { useEffect, useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  gql,
} from "@apollo/client";
import { ApolloProvider, useQuery, useMutation } from "@apollo/client/react";


const client = new ApolloClient({
  link: new HttpLink({ uri: "https://graphqlzero.almansi.me/api" }),
  cache: new InMemoryCache(),
});


const GET_USERS = gql`
  query GetUsers {
    users(options: { paginate: { page: 1, limit: 5 } }) {
      data {
        id
        name
        email
      }
    }
  }
`;


const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String!) {
    updateUser(id: $id, input: { name: $name }) {
      id
      name
      email
    }
  }
`;


const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;


function Users() {
  const { loading, error, data } = useQuery(GET_USERS);

  // Local copy of users so we can update/delete in UI
  const [users, setUsers] = useState([]);

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER);

  // When the query finishes, put the users into local state
  useEffect(() => {
    if (data?.users?.data) {
      setUsers(data.users.data);
    }
  }, [data]);

  const handleUpdate = (id) => {
    const newName = window.prompt("Enter new name:", "Updated Name");
    if (!newName) return;

    updateUser({
      variables: { id, name: newName },
    }).then((result) => {
      console.log("Update mutation result:", result.data);

      // Update UI locally so students see the change
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, name: newName } : user
        )
      );
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    deleteUser({
      variables: { id },
    }).then((result) => {
      console.log("Delete mutation result:", result.data);

      // Remove user from local UI state
      setUsers((prev) => prev.filter((user) => user.id !== id));
    });
  };

  if (loading && users.length === 0) return <p>Loading users...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div style={{ marginTop: "16px" }}>
      <h3>User List (GraphQL Query + Update + Delete)</h3>
      {updating && <p>Updating user...</p>}
      {deleting && <p>Deleting user...</p>}

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {users.map((user) => (
          <li
            key={user.id}
            style={{
              marginBottom: "10px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <strong>{user.name}</strong> — {user.email}
            <div style={{ marginTop: "6px" }}>
              <button
                onClick={() => handleUpdate(user.id)}
                style={{ marginRight: "8px" }}
              >
                Update Name
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                style={{
                  color: "white",
                  backgroundColor: "red",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Delete User
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GraphQLDemo() {
  return (
    <ApolloProvider client={client}>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h2>GraphQL + Apollo: Query, Update & Delete Example</h2>
        <p style={{ maxWidth: "600px", fontSize: "0.9rem", color: "#555" }}>
          This uses the public GraphQLZero API (fake data). Mutations are sent
          to the server, and the UI is updated locally so you can see how
          update and delete would work in a real app.
        </p>
        <Users />
      </div>
    </ApolloProvider>
  );
}

export default GraphQLDemo;

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyOrders } from "../services/orderService";
import { useNavigate } from "react-router-dom";

export default function SignUpSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [needsName, setNeedsName] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    const onToggle = (e) => {
      const open = e?.detail?.open ?? !isOpen;
      if (open) {
        setMounted(true);
        setClosing(false);
        setIsOpen(true);
      } else {
        setClosing(true);
        setIsOpen(false);
        setTimeout(() => setMounted(false), 300);
      }
    };
    window.addEventListener("signup:toggle", onToggle);
    return () => window.removeEventListener("signup:toggle", onToggle);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const res = await getMyOrders();
        setOrders(res || []);
      } catch (e) {
        console.error("Failed to load orders", e);
        toast.error("Could not load your orders");
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, [user]);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const sendOtpRequest = async () => {
    if (!emailInput) return setError("Please enter an email");
    setSendingOtp(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/otp/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (e) {
      console.error(e);
      setError("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtpRequest = async () => {
    if (!emailInput || !otpInput) return setError("Email and OTP required");
    setVerifyingOtp(true);
    setError("");
    try {
      const body = { email: emailInput, code: otpInput };
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/otp/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "OTP verify failed");
      }
      const data = await res.json();
      if (data.needsName) {
        // first-time login: ask for name
        setNeedsName(true);
        setTempToken(data.tempToken);
        toast("Please enter your name to complete sign up");
      } else if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        toast.success("Signed in");
        setClosing(true);
        setIsOpen(false);
        setTimeout(() => setMounted(false), 300);
      }
    } catch (e) {
      console.error(e);
      setError("OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const createUserFromTemp = async () => {
    if (!nameInput) return setError("Name required");
    setCreatingUser(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/otp/create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tempToken}`,
          },
          body: JSON.stringify({ name: nameInput }),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Create user failed");
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Account created and signed in");
      setNeedsName(false);
      setTempToken("");
      setNameInput("");
      setClosing(true);
      setIsOpen(false);
      setTimeout(() => setMounted(false), 300);
    } catch (e) {
      console.error(e);
      setError("Failed to create account");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      const demoUser = {
        _id: "demo123",
        name: "Demo User",
        email: "demo@nufab.com",
        avatar:
          "https://ui-avatars.com/api/?name=Demo+User&background=4285F4&color=fff",
        role: "user",
      };
      const demoToken = "demo-jwt-token-12345";
      localStorage.setItem("token", demoToken);
      localStorage.setItem("user", JSON.stringify(demoUser));
      setUser(demoUser);
      toast.success("Signed in as Demo User");
      setClosing(true);
      setIsOpen(false);
      setTimeout(() => setMounted(false), 300);
    } catch (e) {
      setError("Demo login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Signed out");
    setClosing(true);
    setIsOpen(false);
    //refresh
    setTimeout(() => setMounted(false), 300);
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div>
      <div
        className="fixed inset-0 bg-black/50 z-[11000]"
        onClick={() => {
          setClosing(true);
          setIsOpen(false);
          setTimeout(() => setMounted(false), 300);
        }}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-[11001] shadow-2xl flex flex-col drawer-panel ${
          closing ? "drawer-slide-out" : "drawer-slide-in"
        }`}
      >
        <div className="p-2 border-b">
          <div className="flex items-center justify-between">
            <div className="text-sm text-black font-bdogrotesk">
              {user ? user.name : "Hello Human!"}
            </div>
            <button
              onClick={() => {
                setClosing(true);
                setIsOpen(false);
                setTimeout(() => setMounted(false), 300);
              }}
              className="text-sm text-black font-bdogrotesk"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {user ? (
            <div className="text-center">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full mx-auto mb-4"
              />
              <h4 className="font-semibold">Welcome, {user.name}</h4>
              <p className="text-sm text-gray-500 mb-4">{user.email}</p>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-2 justify-center">
                  {user.role === "admin" && (
                    <button
                      onClick={() => {
                        setClosing(true);
                        setIsOpen(false);
                        setTimeout(() => setMounted(false), 300);
                        window.location.href = "/admin";
                      }}
                      className="px-4 py-2 bg-black text-white rounded"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setClosing(true);
                      setIsOpen(false);
                      setTimeout(() => setMounted(false), 300);
                      window.location.href = "/store";
                    }}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Browse Store
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <h5 className="text-sm font-semibold mb-2">
                    Your Recent Orders
                  </h5>
                  {loadingOrders ? (
                    <div className="text-sm text-gray-500">
                      Loading orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No previous orders found
                    </div>
                  ) : (
                    <ul className="space-y-2 max-h-48 overflow-auto">
                      {orders.slice(0, 5).map((o) => (
                        <li
                          key={o._id}
                          className="flex items-center justify-between bg-white border border-gray-100 p-2 rounded"
                        >
                          <div className="text-sm truncate">
                            <div className="font-medium">
                              Order{" "}
                              <span className="text-gray-500">
                                #{o._id?.slice(0, 8)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              ₹{o.totalPrice} •{" "}
                              {new Date(
                                o.createdAt || o.updatedAt || Date.now()
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                o.status === "paid"
                                  ? "bg-green-50 text-green-700"
                                  : o.status === "shipped"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {o.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setClosing(true);
                        setIsOpen(false);
                        setTimeout(() => setMounted(false), 300);
                        navigate("/orders");
                      }}
                      className="flex-1 px-3 py-2 bg-black text-white rounded text-sm"
                    >
                      View All Orders
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
                  {error}
                </div>
              )}

              {needsName ? (
                // First-time signup UI (matches provided mockup)
                <div>
                  <h2 className="text-3xl font-bold mb-6">
                    New here? Let us show you around!
                  </h2>
                  <div className="mb-6">
                    <label className="text-xs text-gray-600">Full Name</label>
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full border-b py-3 text-lg focus:outline-none"
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="mb-6 flex flex-col gap-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" /> I agree with the{" "}
                      <a className="underline">Terms of Use</a>
                    </label>
                    <label className="flex items-start gap-2">
                      <input type="checkbox" /> I want to receive occasional,
                      thoughtfully sent newsletters with blogs and offers.
                    </label>
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={createUserFromTemp}
                      disabled={creatingUser}
                      className="w-full px-4 py-3 bg-black text-white"
                    >
                      Finish Signing up
                    </button>
                  </div>
                </div>
              ) : (
                // Email + OTP UI (matches provided mockup layout)
                <div>
                  <h2 className="text-5xl font-bdogrotesk text-black font-semibold mb-6">
                    You're choosing to shop cultural time capsules, made with
                    Indian hands and human ideas.
                  </h2>
                  <div className="mb-3">
                    {/* <label className="text-xs text-gray-600">Email</label> */}
                    <input
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full border-b border-black font-bdogrotesk py-2 focus:outline-none"
                      placeholder="Email"
                    />
                  </div>
                  <div className="mb-3">
                    {/* <label className="text-xs text-gray-600">
                      One Time Password
                    </label> */}
                    <input
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full border-b border-black font-bdogrotesk py-2 focus:outline-none"
                      placeholder="One Time Password"
                    />
                    {/* <div className="text-xs text-gray-400 mt-2">OTP sent!</div> */}
                  </div>

                  {/* footer moved out */}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls: shown only when not signed in and not in "needsName" flow */}
        {(!user && !needsName) && (
          <div className="p-4 bg-white pt-4 pb-2 flex flex-col gap-3 text-left z-10">
            <button
              type="button"
              onClick={otpSent ? verifyOtpRequest : sendOtpRequest}
              disabled={sendingOtp || verifyingOtp}
              className="group mt-0 w-full bg-black text-white px-3 py-3 flex items-center justify-between text-[15px] font-semibold tracking-wide box-border"
            >
              <div className="relative h-5 overflow-hidden">
                <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                  <span className="flex font-bdogrotesk h-5 font-medium items-center">
                    {sendingOtp ? 'Sending...' : verifyingOtp ? 'Verifying...' : (otpSent ? 'Submit OTP' : 'Send OTP')}
                  </span>
                  <span className="flex h-5 font-medium items-center">{sendingOtp ? 'Sending...' : verifyingOtp ? 'Verifying...' : (otpSent ? 'Submit OTP' : 'Send OTP')}</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{ border: '1px solid #000', boxSizing: 'border-box', backgroundColor: '#fff' }}
              className="group mt-0 w-full text-black bg-white px-3 py-3 flex items-center justify-between text-[15px] font-semibold tracking-wide"
            >
              <div className="relative h-5 overflow-hidden">
                <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                  <span className="flex h-5 font-medium items-center">Sign in with Google</span>
                  <span className="flex h-5 font-medium items-center">Sign in with Google</span>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
